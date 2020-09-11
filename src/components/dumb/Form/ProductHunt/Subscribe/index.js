import React from 'react';

import './ProductHunt.scss';

function ProductHuntFormSubscribe() {
  return (
    <form
      action="https://api.producthunt.com/widgets/upcoming/v1/upcoming/misakey-v1-2/forms"
      method="post"
      id="ph-email-form"
      name="ph-email-form"
      target="_blank"
    >
      <input
        type="email"
        // value=""
        name="email"
        id="ph-email"
        placeholder="Email Address"
        required
      />
      <input
        type="submit"
        value="Subscribe"
        name="subscribe"
        id="ph-subscribe-button"
      />
    </form>
  );
}

export default ProductHuntFormSubscribe;

