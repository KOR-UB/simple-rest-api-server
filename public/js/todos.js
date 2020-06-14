// State
let todos = [];
const $body = document.querySelector("body");
console.dir(axios)

class Body {
  constructor(domNode) {
    this.bodyNode = domNode;
    this.inputNode = null;
    this.navNode = null;
    this.todosNode = null;
    this.footerNode = document.querySelector("footer");
    this.completeAllNode = null;
    this.completeTodosNode = null;
    this.clearCompletedNode = null;
    this.activeTodosNode = null;
  }
  static keyCode = {
    enter: 13
  }
  init() {
    this._domNodeSettings();
    this._bindEvents();
    axios.get("/todos")
    .then(_todos => {
      todos = _todos.data.sort((a, b) => a.id - b.id);
      todos.forEach(todo => {
        this.paintTodo(todo);
      });
      this.SaveTodos();
    })
    .catch(err => console.error(err));
  }
  _domNodeSettings() {
    const { bodyNode, footerNode } = this;
    this.inputNode = bodyNode.querySelector(".input-todo");
    this.navNode = bodyNode.querySelector(".nav");
    this.todosNode = bodyNode.querySelector(".todos");
    this.completeAllNode = footerNode.querySelector(".checkbox");
    this.clearCompleteNode = footerNode.querySelector(".btn");
    this.completeTodosNode = footerNode.querySelector(".completed-todos");
    this.activeTodosNode = footerNode.querySelector(".active-todos");
  }
  _bindEvents() {
    const { inputNode, navNode, todosNode, completeAllNode, clearCompleteNode } = this;
    inputNode.addEventListener("keyup", this.handleKeyUp.bind(this));
    navNode.addEventListener("click", this.handleToggle.bind(this));
    todosNode.addEventListener("change", this.handleCheck.bind(this));
    todosNode.addEventListener("click", this.handleDeleteTodo.bind(this));
    completeAllNode.addEventListener("change", this.handleCheckAll.bind(this));
    clearCompleteNode.addEventListener("click", this.handleClearTodos.bind(this));
  }
  handleKeyUp(e) {
    const { enter } = Body.keyCode;
    if (e.keyCode !== enter || e.target.value.trim() === "") return;
    e.target.value = e.target.value.trim();
    const toDoObj = {
      id: this._idGenerator(),
      content: e.target.value,
      completed: false,
    }
    axios.post("/todos", toDoObj)
    .then(_todo => {
      todos = [...todos, toDoObj];
      this.SaveTodos()
      this.paintTodo(toDoObj);
    })
    .catch(err => console.error(err));
    e.target.value = "";
  }
  _idGenerator() {
    return todos.length ? Math.max( ...todos.map(todo => todo.id)) + 1 : 1;
  }
  paintTodo(todo) {
    const { todosNode } = this;
    const { id, content, completed } = todo;
    const $li = document.createElement("li"),
    $input = document.createElement("input"),
    $label = document.createElement("label"),
    $i = document.createElement("i");

    $li.id = id;
    $li.className = "todo-item";
    $li.style = `--i: ${todosNode.querySelectorAll(".todo-item").length}`;

    $input.id = `ck-${id}`;
    $input.className = "checkbox";
    $input.setAttribute("type", "checkbox");
    $input.checked = completed;
    
    $label.setAttribute("for", `ck-${id}`);
    $label.textContent = content;

    $i.className = "remove-todo far fa-times-circle";

    $li.appendChild($input);
    $li.appendChild($label);
    $li.appendChild($i);
    todosNode.appendChild($li);
  }
  handleToggle(e) {
    const { navNode, todosNode } = this;
    if(!e.target.matches(".nav > li")) return
    const $active = navNode.querySelector(".active");
    if($active === e.target) return;
    $active.classList.remove("active");
    e.target.classList.add("active");
    todosNode.querySelectorAll("li").forEach(item => todosNode.removeChild(item));
    switch(e.target.id) {
      case "all":
        todos.forEach(todo => {
          this.paintTodo(todo);
        })
        break;
      case "active":
        const activeTodos = todos.filter(todo => !todo.completed)
        activeTodos.forEach(todo => {
          this.paintTodo(todo);
        });
        break;
      case "completed":
        const completeTodos = todos.filter(todo => todo.completed);
        completeTodos.forEach(todo => {
          this.paintTodo(todo);
        });
        break;
    }
    this.SaveTodos();
  }
  handleCheck(e) {
    if (!e.target.matches("li > input.checkbox")) return;
    axios.patch(`/todos/${e.target.parentNode.id}`, { completed })
    .then(
      _todo => {
        todos = _todo.data;
        this.SaveTodos();
        this.changeToggle();
      }
    )
    .catch(err => console.error(err));
  }
  handleDeleteTodo(e) {
    const { todosNode } = this;
    if (!e.target.matches("li > i")) return;
    axios.delete(`/todos/${e.target.parentNode.id}`)
    .then(_todos => {
      todos = _todos.data.filter(todo => todo.id !== parseInt(e.target.parentNode.id));
      this.SaveTodos();
    })
    .catch(err => console.error(err));
    e.target.parentNode.classList.toggle("bye");
    setTimeout(() => {
      todosNode.removeChild(e.target.parentNode);
    },1000)
  }
  handleCheckAll(e) {
    const { todosNode } = this;
    const completed = e.target.checked;
    axios.patch("/todos", { completed })
    .then( _todo => {
      todos = _todo.data;
      this.SaveTodos();
      this.changeToggle();
    })
    .catch(err => console.error(err));
    todosNode.querySelectorAll("li input.checkbox").forEach(item => {
      item.checked = item.checked = e.target.checked;
    });
  }
  handleClearTodos(e) {
    const { todosNode } = this;
    const checkboxAll = todosNode.querySelectorAll("li input.checkbox")
    checkboxAll.forEach(item => item.checked ? item.parentNode.classList.toggle("bye") : !item.checked);
    axios.delete(`/todos/completed`)
    .then(_todos => {
      todos = _todos.data;
      this.SaveTodos();
    })
    .catch(err => console.error(err));
    setTimeout(() => {
      checkboxAll.forEach(item => item.checked ? todosNode.removeChild(item.parentNode) : !item.checked);
    }, 1000)
  }
  SaveTodos() {
    const { completeTodosNode, activeTodosNode, completeAllNode } = this;
    completeAllNode.checked = todos.every(todo => todo.completed) ? true : false;
    completeTodosNode.textContent = todos.filter(todo => todo.completed ).length;
    activeTodosNode.textContent = todos.filter(todo => !todo.completed).length;
  }
  changeToggle() {
    const { navNode, todosNode } = this;
    const $active = navNode.querySelector(".active");
    const $all = navNode.firstElementChild;
    if($active.id === $all.id) return;
    $active.classList.remove("active");
    $all.classList.add("active");
    todosNode.querySelectorAll("li").forEach(item => todosNode.removeChild(item));
    todos.forEach(todo => {
      this.paintTodo(todo);
    });
  }
}
window.onload = () => {
  const _Body = new Body($body);
  _Body.init();
}