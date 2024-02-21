const host = 'localhost:2222';

const http = {
  get: async (url) => {
    const res = await fetch(`http://${host}/${url}`);
    return res.json();
  },
  post: async (url, data) => {
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(data),
    };

    const res = await fetch(`http://${host}/${url}`, options);
    return res.json();
  },
  getWithToken: async (url) => {
    const options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
    };

    const res = await fetch(`http://${host}/${url}`, options);
    return res.json();
  },
  postWithToken: async (url, data) => {
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: localStorage.getItem('token'),
      },
      body: JSON.stringify(data),
    };

    const res = await fetch(`http://${host}/${url}`, options);
    return res.json();
  },
};

export default http;
