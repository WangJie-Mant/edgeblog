import { CarouselItem } from "./CarouselItem";
import CarouselClient from "./CarouselClient";

export default function Carousel() {
  return <CarouselClient items={CarouselItem} />;
}
