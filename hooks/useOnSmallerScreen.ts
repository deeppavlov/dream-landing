import { useEffect, useState } from "react";

const useOnSmallerScreen = ({
  width = -1,
  height = -1,
}: {
  width?: number;
  height?: number;
}) => {
  const [triggered, setTrigger] = useState(false);
  useEffect(() => {
    const measure = () =>
      setTrigger(window.innerWidth <= width || window.innerHeight <= height);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [height, width]);

  return triggered;
};

export default useOnSmallerScreen;
