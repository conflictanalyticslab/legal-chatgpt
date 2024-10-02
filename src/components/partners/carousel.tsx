import React from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ACADEMIC_PARTNERS } from "./partners";

function Carousel({ slideRight, className, orderOpposite }: any) {
  const displayPartners = orderOpposite
    ? [...ACADEMIC_PARTNERS].reverse()
    : ACADEMIC_PARTNERS;
    
  return (
    <div
      className={cn(
        "flex gap-[20px] absolute mt-10 slide-left",
        { "slide-right": slideRight },
        { "slide-left": !slideRight },
        className
      )}
    >
      {displayPartners.map((img, key) => (
        <Card
          key={key}
          className="relative w-[150px] sm:w-[170px] lg:w-[180px] xl:w-[200px] h-[150px] sm:h-[170px] lg:h-[180px] xl:h-[200px] p-[20px] rounded-[.8rem] flex items-center justify-center"
        >
          <div className={cn("relative m-auto", img.width, img.height)}>
            <Image src={img.url} fill alt="img" className="object-contain" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default Carousel;
