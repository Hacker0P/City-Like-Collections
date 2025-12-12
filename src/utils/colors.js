export const getColorHex = (colorName) => {
    if (!colorName) return null;
    const normalized = colorName.toLowerCase().replace(/[\s-]/g, ''); // 'navyblue'
    
    // Custom mapping for fashion colors
    const colors = {
        'navy': '#000040',
        'navyblue': '#000080',
        'maroon': '#800000',
        'olive': '#808000',
        'teal': '#008080',
        'mustard': '#ffdb58',
        'peach': '#ffe5b4',
        'coral': '#ff7f50',
        'lavender': '#e6e6fa',
        'beige': '#f5f5dc',
        'cream': '#fffdd0',
        'camel': '#c19a6b',
        'sage': '#bcb88a',
        'sagegreen': '#9dc183',
        'rust': '#b7410e',
        'mauve': '#e0b0ff',
        'charcoal': '#36454f',
        'burgundy': '#800020',
        'offwhite': '#f8f9fa',
        'khaki': '#c3b091',
        'mint': '#3eb489',
        'mintgreen': '#98ff98',
        'skyblue': '#87ceeb',
        'babyblue': '#89cff0',
        'rose': '#ff007f',
        'rosegold': '#b76e79',
        'tan': '#d2b48c',
        'denim': '#1560bd',
        'cyan': '#00ffff',
        'magenta': '#ff00ff',
        'lime': '#00ff00',
        'indigo': '#4b0082',
        'violet': '#ee82ee',
        'brown': '#a52a2a',
        'grey': '#808080',
        'gray': '#808080',
        'black': '#000000',
        'white': '#ffffff',
        'bottle green': '#006a4e',
        'bottlegreen': '#006a4e',
        'royal blue': '#4169e1',
        'royalblue': '#4169e1',
        'army green': '#4b5320',
        'armygreen': '#4b5320',
        'pink': '#ffc0cb',
        'hotpink': '#ff69b4',
        'gold': '#ffd700',
        'silver': '#c0c0c0',
        'bronze': '#cd7f32',
        'copper': '#b87333',
        // Add more as needed
    };

    // Check map
    if (colors[normalized]) return colors[normalized];

    // Try Standard CSS
    if (CSS.supports('color', colorName)) return colorName;

    // Fallback
    return null;
};
