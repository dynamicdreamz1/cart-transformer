// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};
// var result = [];
var operationsArray = [];

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  // console.log('input => ', JSON.stringify(input));
  const metfield = JSON.parse(input.cartTransform.metafield?.value ?? "{}");
  console.log('metfield => ', JSON.stringify(metfield));
  input.cart.lines.forEach(line => {

    if (metfield.product_id.includes(line.merchandise.id)) {
      operationsArray.push({
        cartLineId: line.id,
        quantity: line.quantity
      })
    }

  });
  return {
    operations: [
      {
        merge: {
          cartLines:operationsArray,
          price: {
            percentageDecrease: {
              value: metfield.discount_percentage
            }
          },
          parentVariantId: metfield.bundle_id,
          title: metfield.title
        }
      },
    ]
  }
};