import React from "react";
import { Link } from "react-router-dom";
import { FaCrown } from "react-icons/fa";

interface UserProfileMenuProps {
	currentUser?: {
		_id: string;
		userType: "ADMIN" | "USER";
	};	
	closeMenuHandler: () => void;
	logoutHandler: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
	currentUser,	
	closeMenuHandler,
	logoutHandler,
}) => {
	return (
		<div className="">
			<Link
				to={`/user/my-page?userId=${currentUser?._id}`}
				className="text-sm inline md:text-base hover:text-black hover:font-semibold w-full px-2 md:py-2"
				onClick={closeMenuHandler}
			>
				My Profile
			</Link>
			<Link
				to="/user/last-visited"
				className="text-sm md:text-base hover:text-black hover:font-semibold w-full px-2 md:py-2"
				onClick={closeMenuHandler}
			>
				Last Visited
			</Link>
			{currentUser?.userType === "ADMIN" && (
				<Link
					to="/_admin"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center px-2 text-sm md:text-base hover:text-black hover:font-semibold w-full md:py-2"
					onClick={closeMenuHandler}
				>
					<p className="mr-1">Dashboard</p>
					<FaCrown className="text-yellow-500 text-lg" />
				</Link>
			)}			
			<Link
				to="/user/barbers"
				className="text-sm md:text-base px-2 hover:text-black hover:font-semibold w-full md:py-2"
				onClick={closeMenuHandler}
			>
				My Barbers
			</Link>						
			<Link
				to="/user/notifications"
				className="text-sm md:text-base px-2 hover:text-black hover:font-semibold w-full md:py-2"
				onClick={closeMenuHandler}
			>
				Notifications
			</Link>
			<Link
				to="/user/cs"
				className="text-sm md:text-base px-2 hover:text-black hover:font-semibold w-full md:py-2"
				onClick={closeMenuHandler}
			>
				Customer Service
			</Link>			
			<Link
				to="#"
				className="text-sm md:text-base px-2 hover:text-black hover:font-semibold w-full md:py-2"
				onClick={logoutHandler}
			>
				Log Out
			</Link>
		</div>
	);
};
