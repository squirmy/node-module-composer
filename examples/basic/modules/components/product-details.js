export default {
    productDetails: ({ services }) => ({ product }) => {
        // When Add to Cart button clicked...
        services.addToCart({ product, quantity: 1 });
    }
};
