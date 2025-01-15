import usePasswordToggle from "../../utils/usePasswordToggle";

const PasswordInput = (props) => {
  const { setPassword, required = true } = props;
  const [InputType, Icon] = usePasswordToggle();

  return (
    <div className="grid gap-2 focus-within:text-sky-700 group/input">
      <label htmlFor="password" className="max-w-max hover:text-sky-700">
        Password
      </label>
      <div className="relative">
        <input
          type={InputType}
          id="password"
          name="password"
          required={required}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 pr-12 rounded border border-slate-300 group-hover/input:border-sky-700 focus:outline-sky-700 text-slate-800"
        />
        {Icon}
      </div>
    </div>
  );
};

export default PasswordInput;
