"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStoreProductToGalleryItem = mapStoreProductToGalleryItem;
exports.mapStoreProductsToGalleryItems = mapStoreProductsToGalleryItems;
function mapStoreProductToGalleryItem(product, countryCode = "dk") {
    const metadata = (product.metadata?.gallery || {});
    // Primary Image Fallback Policy
    const primaryImageUrl = product.thumbnail ||
        product.images?.[0]?.url ||
        "https://via.placeholder.com/800x1000?text=No+Image";
    const primaryImage = {
        url: primaryImageUrl,
        alt: product.title || "Product image",
    };
    // Scenes mapping from product.images or metadata.sceneImages
    const scenes = [];
    if (metadata.sceneImages && Array.isArray(metadata.sceneImages)) {
        metadata.sceneImages.forEach((img, idx) => {
            scenes.push({
                id: `scene-${idx}`,
                image: {
                    url: img.url,
                    alt: img.alt || `${product.title} scene ${idx + 1}`,
                },
                label: img.label || `Scene ${idx + 1}`,
            });
        });
    }
    else if (product.images && product.images.length > 1) {
        product.images.slice(1).forEach((img, idx) => {
            scenes.push({
                id: `img-${img.id || idx}`,
                image: {
                    url: img.url,
                    alt: `${product.title} angle ${idx + 2}`,
                },
                label: `View ${idx + 2}`,
            });
        });
    }
    // Price Calculation Policy
    let price;
    const firstVariant = product.variants?.[0];
    if (firstVariant?.calculated_price) {
        const calc = firstVariant.calculated_price;
        const amount = calc.calculated_amount ?? 0;
        const currencyCode = (calc.currency_code || "eur").toUpperCase();
        const formatted = new Intl.NumberFormat(countryCode || "en-US", {
            style: "currency",
            currency: currencyCode,
        }).format(amount);
        price = {
            amount,
            currencyCode,
            formatted,
        };
    }
    // Availability Policy
    let availability = "available";
    if (!product.variants || product.variants.length === 0) {
        availability = "unavailable";
    }
    else {
        const totalInventory = product.variants.reduce((acc, v) => acc + (v.inventory_quantity ?? 0), 0);
        if (totalInventory === 0) {
            availability = "out-of-stock";
        }
        else if (totalInventory <= 5) {
            availability = "low-stock";
        }
    }
    const categoryName = product.categories?.[0]?.name;
    return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        contextualName: metadata.contextualName || product.title,
        description: product.description || metadata.story || undefined,
        artist: metadata.artist || "Medusa Studio",
        material: metadata.material || undefined,
        category: categoryName || undefined,
        year: metadata.year || new Date().getFullYear(),
        primaryImage,
        scenes,
        price,
        availability,
        productUrl: `/${countryCode}/products/${product.handle}`,
        ambientColors: metadata.ambientColors || ["#1a1a2e", "#16213e", "#0f3460"],
        metadata: product.metadata,
    };
}
function mapStoreProductsToGalleryItems(products, countryCode = "dk") {
    return products.map((p) => mapStoreProductToGalleryItem(p, countryCode));
}
