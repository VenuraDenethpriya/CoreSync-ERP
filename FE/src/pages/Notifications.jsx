import React from 'react';
import BreadCrumbs from '../components/ui/BreadCrumbs';

const Notifications = () => {
  const breadcrumbs = [
    { name: "Dashboard", link: "/" },
    { name: "Notifications", link: "/notifications" },
  ];
  
  return (
    <div>
      <BreadCrumbs breadcrumbs={breadcrumbs} />
    </div>
  );
}

export default Notifications
