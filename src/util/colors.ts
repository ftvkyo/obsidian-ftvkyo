function generateColors() {
    const colors = [];

    for (let hue = 0; hue < 20; hue++) {
        colors.push(`hsl(${hue * 18}deg, 100%, 70%)`);
    }

    return colors;
}


const colors = generateColors();


export function getColor(index: number) {
    return colors[index % colors.length];
}
