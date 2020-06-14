// export const ajax = (() => {
//   const req = (method, url, callback, payload) => {
//     const xhr = new XMLHttpRequest();
//     xhr.open(method, url);
//     xhr.setRequestHeader('content-type', 'application/json');
//     xhr.send(JSON.stringify(payload));

//     xhr.onload = () => {
//       if (xhr.status === 200 || xhr.status === 201) {
//         callback(JSON.parse(xhr.response));
//       } else {
//         console.error(xhr.status);
//       }
//     };
//   };

//   return {
//     get(url, callback) {
//       req('GET', url, callback);
//     },
//     post(url, payload, callback) {
//       req('POST', url, callback, payload);
//     },
//     patch(url, payload, callback) {
//       req('PATCH', url, callback, payload);
//     },
//     delete(url, callback) {
//       req('DELETE', url, callback);
//     }
//   };
// })();

export const ajax = (() => {
  const req = (method, url, payload) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify(payload));
  
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(xhr.status));
        }
      };
    });
  };

  return {
    get(url) {
      return req('GET', url);
    },
    post(url, payload) {
      return req('POST', url, payload);
    },
    patch(url, payload) {
      return req('PATCH', url, payload);
    },
    delete(url) {
      return req('DELETE', url);
    }
  };
})();