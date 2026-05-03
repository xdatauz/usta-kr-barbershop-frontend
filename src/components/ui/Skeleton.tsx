import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
}

const Skeleton = ({ className, ...rest }: SkeletonProps) => (
	<div
		{...rest}
		className={cn("animate-pulse rounded-lg bg-muted", className)}
	/>
);

export { Skeleton };
export default Skeleton;
