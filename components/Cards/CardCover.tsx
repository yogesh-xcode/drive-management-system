import { CardCoverProps } from "@/types";

const CardCover: React.FC<CardCoverProps> = ({ children }) => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-3 px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:py-4 *:data-[slot=card]:gap-3 *:data-[slot=card]:shadow-xs [&_[data-slot=card-header]]:px-4 [&_[data-slot=card-footer]]:px-4 lg:px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 justify-center">
      {children}
    </div>
  );
};

export default CardCover;
