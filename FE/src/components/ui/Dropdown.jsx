import { Field, ErrorMessage } from "formik";

const Dropdown = ({ label, name, options, unit }) => {
  return (
    <div className="mb-1">
      <label className="block text-sm font-medium mb-2">{label}</label>
        <Field as="select" name={name} className="w-full border p-2 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-600 text-sm"
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {unit ? `${option} ${unit}` : option}
            </option>
          ))}
        </Field>
      <ErrorMessage name={name} component="div" className="text-red-500 mt-1 text-sm" />
    </div>
  );
};

export default Dropdown;
