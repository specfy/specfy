import { v1 } from './plans.js';
import { stripe } from './stripe.js';

// ts-node --esm ./src/billing/seed.ts
(async () => {
  await Promise.all(
    Object.entries(v1).map(async ([, value]) => {
      try {
        const exists = await stripe.products.retrieve(value.id);
        if (exists) {
          console.log('Product', value.name, 'exists');
          return;
        }
      } catch {
        // 404
      }

      const product = await stripe.products.create({
        id: value.id,
        name: value.name,
        description: value.description,
        metadata: {
          version: 'v1',
        },
      });
      const price = await stripe.prices.create({
        lookup_key: value.price.key,
        unit_amount: value.price.amount,
        currency: value.price.currency,
        recurring: {
          interval: 'month',
        },
        product: product.id,
      });

      console.log({ name: value.name, product: product.id, price: price.id });
    })
  );
})();
