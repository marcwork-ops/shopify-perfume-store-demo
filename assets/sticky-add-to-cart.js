if (!customElements.get('sticky-add-to-cart')) {
  customElements.define(
    'sticky-add-to-cart',
    class StickyAddToCart extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.section;
        this.targetButton = document.getElementById(`ProductSubmitButton-${this.sectionId}`);
        if (!this.targetButton) return;

        this.button = this.querySelector('.sticky-atc__button');
        this.button.addEventListener('click', () => {
          this.targetButton.click();
        });

        this.syncButton();
        this.buttonObserver = new MutationObserver(() => this.syncButton());
        this.buttonObserver.observe(this.targetButton, {
          attributes: true,
          attributeFilter: ['disabled'],
          childList: true,
          subtree: true,
          characterData: true,
        });

        // Show only once the real button has scrolled above the viewport.
        this.visibilityObserver = new IntersectionObserver(([entry]) => {
          this.toggle(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
        this.visibilityObserver.observe(this.targetButton);

        this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
          if (data.sectionId !== this.sectionId) return;
          this.updateVariant(data);
        });
      }

      disconnectedCallback() {
        this.buttonObserver?.disconnect();
        this.visibilityObserver?.disconnect();
        this.variantChangeUnsubscriber?.();
      }

      toggle(show) {
        this.classList.toggle('sticky-atc--visible', show);
        this.setAttribute('aria-hidden', String(!show));
        this.button.tabIndex = show ? 0 : -1;
        document.body.classList.toggle('sticky-atc-open', show);
      }

      syncButton() {
        this.button.disabled = this.targetButton.disabled;
        const label = this.targetButton.querySelector('span')?.textContent.trim();
        if (label) this.button.textContent = label;
      }

      updateVariant({ html, variant }) {
        const price = html.getElementById(`price-${this.sectionId}`);
        const priceTarget = this.querySelector('.sticky-atc__price');
        if (price && priceTarget) priceTarget.innerHTML = price.innerHTML;

        const variantTitle = this.querySelector('.sticky-atc__variant');
        if (variantTitle && variant) variantTitle.textContent = variant.title;
      }
    }
  );
}
