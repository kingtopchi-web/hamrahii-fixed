import { useState, useEffect } from "react";

export const useTypewriter = ({
  words = [],
  typeSpeed = 85,
  deleteSpeed = 45,
  delaySpeed = 2200,
  loop = true,
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    let timer;
    const currentWord = words[wordIndex % words.length];

    if (isDeleting) {
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, text.length - 1));
        }, deleteSpeed);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(currentWord.substring(0, text.length + 1));
        }, typeSpeed);
      } else {
        if (!loop && wordIndex === words.length - 1) return;
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delaySpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, delaySpeed, loop]);

  return text;
};
