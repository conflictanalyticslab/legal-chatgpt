import Image from "next/image";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import Container from "../ui/Container";

export function TwoPartners({ title, description, partners, textLeft }: any) {
  return (
    <Container className="flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full min-h-[635px] gap-[30px] lg:gap-[60px] xl:gap-[80px] py-[50px]">
      <div className={cn("flex gap-[30px] justify-start flex-wrap sm:flex-nowrap xl:gap-[40px] order-2 w-[100%] max-w-[771px] lg:w-auto", { "lg:order-1": textLeft })}>
        {partners.map((partner: any, key: string) => (
          <Card
            key={key}
            className="relative w-[100%] sm:w-[170px] lg:w-[210px] xl:w-[260px] h-[150px] sm:h-[170px] lg:h-[210px] xl:h-[260px] p-[20px] rounded-[.8rem] flex items-center justify-center shadow-md"
          >
            <div
              className={cn("relative m-auto", partner.width, partner.height)}
            >
              <Image
                src={partner.url}
                fill
                alt="img"
                className="object-contain"
              />
            </div>
          </Card>
        ))}
      </div>
      <div className="flex flex-col justify-start w-[100%] max-w-[771px] order-1">
        <h2 className="text-[2rem] lg:text-[length:--subheading]">{title}</h2>
        <p className="text-md md:text-xl text-[--grey] lg:leading-relaxed">{description}</p>
      </div>
    </Container>
  );
}
