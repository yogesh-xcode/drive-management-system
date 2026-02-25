import { ColumnCoverProps } from "@/types";

const ColumnCover: React.FC<ColumnCoverProps> = ({ children }) => {
  return (
    <div className="">
      <p className="">{children}</p>
    </div>
  );
};

export default ColumnCover;
