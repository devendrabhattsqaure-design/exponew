// assets
import { AppstoreAddOutlined, CalendarOutlined, UsergroupAddOutlined } from '@ant-design/icons';

// icons
const icons = {
  AppstoreAddOutlined,
  CalendarOutlined,
  UsergroupAddOutlined
};

// ==============================|| MENU ITEMS - MANAGEMENT ||============================== //

const management = {
  id: 'management',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'turf-manage',
      title: 'Manage Turfs',
      type: 'item',
      url: '/manage/turfs',
      icon: icons.AppstoreAddOutlined
    },
    {
      id: 'booking-manage',
      title: 'All Bookings',
      type: 'item',
      url: '/manage/bookings',
      icon: icons.CalendarOutlined
    },
    {
      id: 'admin-manage',
      title: 'Team Management',
      type: 'item',
      url: '/manage/admins',
      icon: icons.UsergroupAddOutlined
    },
    {
      id: 'employee-manage',
      title: 'Manage Employees',
      type: 'item',
      url: '/manage/employees',
      icon: icons.UsergroupAddOutlined
    }
  ]
};

export default management;
