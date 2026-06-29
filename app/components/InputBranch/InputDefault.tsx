interface InputBranchProps {
  legend: string;
  type: "text" | "password" | "email";
  placeholder: string;
  instructions?: string;
}

export default function InputDefault({
  legend,
  type,
  placeholder,
  instructions,
}: InputBranchProps) {
  return (
    <div>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">{legend}</legend>
        <input type={type} className="input" placeholder={placeholder} />
        {instructions && <p className="label">{instructions}</p>}
      </fieldset>
    </div>
  );
}
