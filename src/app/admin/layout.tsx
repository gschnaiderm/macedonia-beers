import { PackageIcon } from "lucide-react";

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="container mx-auto px-4 py-8 md:px-6">
			<div className="mb-8 flex items-center gap-3 border-b border-zinc-200 pb-4">
				<PackageIcon className="size-6 text-red-700" />
				<h1 className="text-2xl font-bold tracking-tight text-zinc-900">
					Panel de Administración
				</h1>
			</div>
			{children}
		</div>
	);
}
