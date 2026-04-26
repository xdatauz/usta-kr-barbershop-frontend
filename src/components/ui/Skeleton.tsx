import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
}

const Skeleton = ({ className = "", ...rest }: SkeletonProps) => (
	<div
		{...rest}
		className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/70 ${className}`}
	/>
);

export default Skeleton;
