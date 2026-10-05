export const Flag = ({ code, size = 40 }) => {
    console.log(code , size)
  if (!code) return null;

  return (
    <img
      src={`https://flagcdn.com/w${size}/${code.toLowerCase()}.png`}
      alt={code}
      loading="lazy"
      style={{ borderRadius: 4 }}
    />
    // <div>hellow</div>
  );
};
