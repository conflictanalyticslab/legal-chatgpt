import React from "react";
import Carousel from "./Carousel";
import Container from "../ui/container";
import { cn } from "@/utils/utils";

function SlidingPartners({ title, description, className }: any) {
  return (
    <div className={cn("bg-white py-[50px]", className)}>
      <Container className="min-h-[700px] sm:min-h-[700px] lg:min-h-[700px]">
        <div>
          <h2 className="text-[2rem] lg:text-[length:--subheading]">{title}</h2>
          <p className="text-base md:text-xl text-[--grey] lg:leading-relaxed w-[100%] md:w-[85%] max-w-[1350px]">
            {description}
          </p>
        </div>
        <div className="relative">
          <Carousel slideRight={true} />
          <Carousel
            slideRight={false}
            orderOpposite={true}
            className="top-[170px] sm:top-[190px] lg:top-[200px] xl:top-[220px]"
          />
        </div>
      </Container>
    </div>
  );
}

export default SlidingPartners;
