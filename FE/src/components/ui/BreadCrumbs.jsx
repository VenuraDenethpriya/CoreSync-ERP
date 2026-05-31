import { Link } from "react-router-dom";

const BreadCrumbs = ({ breadcrumbs }) => {
  return (
    <>
      <div className="w-full lg:w-[90%] mx-auto my-4 lg:my-10 flex flex-col lg:flex-row items-start lg:items-center justify-between">
        {/* Page Name */}
        <h1 className="text-2xl lg:text-4xl font-semibold leading-tight mb-2 lg:mb-0">
          {breadcrumbs[breadcrumbs.length - 1].name}
        </h1>

        {/* Breadcrumb Navigation */}
        <ul className="flex items-center text-sm lg:text-base text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {crumb.link ? (
                <Link to={crumb.link} className="text-gray-500 hover:text-blue-700">
                  {crumb.name}
                </Link>
              ) : (
                <span>{crumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default BreadCrumbs;
