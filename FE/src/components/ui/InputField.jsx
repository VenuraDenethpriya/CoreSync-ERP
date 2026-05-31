import { Field, ErrorMessage } from "formik";

const InputField = ({ label, name, type = "text", unit }) => {
  return (
    <div className="mb-1">
      <label className="block text-sm font-medium mb-2">{label}</label>
      {type === "textarea" ? (
        <Field as="textarea" name={name} className="w-full border p-2 rounded-md shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 h-20 text-gray-600 text-sm"
        />
      ) : (
        <div className="relative">
        <Field name={name} type={type} className={`w-full border p-2 rounded-md shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300 text-gray-600 text-sm`}
        />
        {unit && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
            {unit}
          </span>
        )}
      </div>
      )}
      <ErrorMessage name={name} component="div" className="text-red-500 mt-1 text-sm" />
    </div>
  );
};

export default InputField;
