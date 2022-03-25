import { useCallback, useState } from "react";

const usePost = (apiUrl: string) => {
  const [error, setError] = useState<null | string>(null);
  const post = useCallback(
    (endpoint: string, body: object) => {
      if (error) setError(null);
      return fetch(apiUrl + endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.text())
        .then((res) => (res === "" ? res : JSON.parse(res)))
        .catch((err) => setError(`${err}`));
    },
    [error]
  );

  return { error, post };
};

export default usePost;
