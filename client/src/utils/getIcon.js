import { CiCalendarDate } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { RxDashboard } from "react-icons/rx";
import { IoShareSocialSharp, IoBanOutline } from "react-icons/io5";
import { 
  FaLinkedin, 
  FaUserPlus, 
  FaMailBulk, 
  FaGithub, 
  FaUserCircle, 
  FaRegEdit 
} from "react-icons/fa";
import { GiCheckMark } from "react-icons/gi";
import { HiArrowLongRight } from "react-icons/hi2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const getIcon = (icon, options = {}) => {
  // Default icon props
  const iconProps = {
    className: [
      'mb-1',
      options.size ? `fs-${options.size}` : '',
      options.color ? `text-${options.color}` : '',
      options.margin ? `me-${options.margin}` : 'me-2'
    ].filter(Boolean).join(' '),
    style: {
      cursor: options.onClick ? 'pointer' : 'inherit',
      ...(options.style || {})
    },
    onClick: (e) => {
      if (options.onClick) {
        options.onClick(e);
      }
      if (options.tooltip) {
        toast.info(options.tooltip, {
          position: "top-right",
          autoClose: 3000,
          className: 'bg-info text-white'
        });
      }
    }
  };

  // Icon mapping
  const icons = {
    leave: <CiCalendarDate {...iconProps} />,
    profile: <CgProfile {...iconProps} />,
    dashboard: <RxDashboard {...iconProps} />,
    email: <FaMailBulk {...iconProps} />,
    linkedIn: <FaLinkedin {...iconProps} />,
    joiningDate: <FaUserPlus {...iconProps} />,
    githubId: <FaGithub {...iconProps} />,
    share: <IoShareSocialSharp {...iconProps} />,
    check: <GiCheckMark {...iconProps} />,
    reject: <IoBanOutline {...iconProps} />,
    'right-arrow': <HiArrowLongRight {...iconProps} />,
    user: <FaUserCircle {...iconProps} />,
    edit: <FaRegEdit {...iconProps} />
  };

  return icons[icon] || null;
};