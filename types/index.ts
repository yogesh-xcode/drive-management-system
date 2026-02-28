import { serviceMap } from "@/lib/repositories/services";
import { Icon } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";

// 1. Base/Utility Types

export interface BaseProps {
  children?: React.ReactNode;
  className?: string;
}

// 2. Data Models (add more like Staff, Candidate as needed)

export interface Client {
  id: number;
  id_uuid?: string;
  user_id?: string;
  programNo: number;
  date: string | Date;
  client: string;
  opening: number;
  contact: string;
}

export interface Candidate {
  id: number;
  fullName: string;
  position: string;
  status: string;
  appliedDate: string | Date;
}

export interface Staff {
  id: number;
  name: string;
  department: string;
  email: string;
  joinedDate: string | Date;
}

export interface Drive {
  id: number;
  title: string;
  location: string;
  status: string; // e.g. "Scheduled" | "Ongoing" | "Completed"
  date: string | Date;
}


// 3. Table/Table-related Types

export interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  fields?: any[]; // for SidePeak forms, if included
  onAdd?: (values: T) => Promise<void>;
  onEdit?: (row: T, values: T) => Promise<void>;
  onDelete?: (row: T) => Promise<void>;
  title?: string;
  immutableFields?: string[];
}

export interface TablePaginationProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  fields?: any[];
  onAdd?: (values: T) => Promise<void>;
  onEdit?: (row: T, values: T) => Promise<void>;
  onDelete?: (row: T) => Promise<void>;
  title?: string;
  rowsPerPage?: number;
}

export interface ColumnCoverProps extends BaseProps {}

// 4. Card/Summary Widgets

export interface SectionCardProps {
  metric: number;
  description: string;
}

export interface CardCoverProps extends BaseProps {}

// 5. Button Components (GENERIC)

export interface BaseButtonProps extends BaseProps {
  onClick?: () => void;
}

export interface AddButtonProps<T> extends BaseButtonProps {
  onSubmit: (values: T) => Promise<void>;
}

export interface ExportButtonProps extends BaseButtonProps {
  entity: keyof typeof serviceMap;
  fileName?: string;
  children?: React.ReactNode;
}

// 6. SidePeak Modal for Forms (GENERIC, like for Add/Edit)

export interface SidePeakProps<T> extends BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update";
  fields: any[];
  initialValues?: Partial<T>;
  immutable?: string[];
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => string | null;
  closeOnSuccess?: boolean;
}

// 7. Supabase Auth
export interface AuthParams {
  email: string;
  password: string;
}

export interface SignUpParams extends AuthParams {
  display_name: string;
}

export interface SignInParams extends AuthParams {}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: Icon;
}

export interface NavMainProps {
  items: NavMainItem[];
}
