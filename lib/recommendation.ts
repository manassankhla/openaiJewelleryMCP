import products from "@/data/products.json";

export function recommendJewellery({
  occasion,
  outfitColor,
  outfitType,
  style,
}: {
  occasion?: string;
  outfitColor?: string;
  outfitType?: string;
  style?: string;
}) {
  return products
    .map((product) => {
      let score = 0;

      if (
        occasion &&
        product.aiTags.occasionTags.includes(
          occasion.toLowerCase()
        )
      )
        score += 30;

      if (
        outfitColor &&
        product.aiTags.bestOutfitColours.includes(
          outfitColor.toLowerCase()
        )
      )
        score += 30;

      if (
        outfitType &&
        product.aiTags.bestOutfitTypes.includes(
          outfitType.toLowerCase()
        )
      )
        score += 20;

      if (
        style &&
        product.aiTags.styleTags.includes(
          style.toLowerCase()
        )
      )
        score += 20;

      return {
        ...product,
        score,
      };
    })
    .filter((product) => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}