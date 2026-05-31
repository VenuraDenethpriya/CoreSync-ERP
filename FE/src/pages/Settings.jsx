import React from 'react'
import BreadCrumbs from '../components/ui/BreadCrumbs';

const Settings = () => {
  const breadcrumbs = [
    { name: "Dashboard", link: "/" },
    { name: "Settings", link: "/settings" },
  ];
  
  return (
    <div>
      <BreadCrumbs breadcrumbs={breadcrumbs} />
    </div>
  );return (
    <div>
      
    </div>
  )
}

export default Settings
