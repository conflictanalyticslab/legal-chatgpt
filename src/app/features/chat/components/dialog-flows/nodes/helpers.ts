export function calculateHandleAngles(
  count: number,
  centerAngle: number
): number[] {
  if (count <= 0) return [];
  if (count === 1) return [centerAngle];

  const angles: number[] = [];
  const halfRange = 180 / 2;

  const spacing = 180 / (count + 1);

  for (let i = 1; i <= count; i++) {
    const angle = centerAngle - halfRange + spacing * i;
    angles.push(angle);
  }

  return angles;
}

export function angleToCoordinates(
  angle: number,
  radius: number
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians),
  };
}
