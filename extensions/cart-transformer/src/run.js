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
var operationsArray = {};
var final = [];

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  // console.log('input => ', JSON.stringify(input));
  const metfield = JSON.parse(input.cartTransform.metafield?.value ?? "{}");

  input.cart.lines.forEach(line => {
    metfield.bundles.forEach(bundle => {
      bundle.bundle_components.forEach(product => {
        // console.log(product.bundle_component_variant_id +'=='+ line.merchandise.id);

        if (product.bundle_component_variant_id == line.merchandise?.id) {

          if(bundle.bundle_product_id in operationsArray) {
            operationsArray[bundle.bundle_product_id].merge.cartLines.push({
              cartLineId: line.id,
              quantity: bundle.bundle_components.quantity ?? 1,
            });
          } else {
            operationsArray[bundle.bundle_product_id] = {
              merge: {
                cartLines: [],
                parentVariantId: bundle.bundle_product_id,
                title: bundle.title ?? 'Custom Bundle',
                price: {
                  percentageDecrease: {
                    value: bundle.discount_percentage ?? 0
                  }
                }
              }
            };

            operationsArray[bundle.bundle_product_id].merge.cartLines.push({
              cartLineId: line.id,
              quantity: bundle.bundle_components.quantity ?? 1,
            });
          }

          // console.log('operationsArray => ', JSON.stringify(operationsArray));
        }
      })
    })
  })

  // console.log('operationsArray => ', JSON.stringify(operationsArray));

  if(Object.keys(operationsArray).length !== 0 ) {
    Object.keys(operationsArray).forEach(function(key, index) {
      final.push(operationsArray[key]);
    });

    console.log('final => ', JSON.stringify(final));

    return {
      operations: final
    }
  } else {
    return NO_CHANGES;

  }

};
