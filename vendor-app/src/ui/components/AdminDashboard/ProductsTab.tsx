import { useState } from 'react';
import CampaignsTab from './CampaignsTab';
import DishesTab from './DishesTab';
import MealPlanTab from './MealPlanTab';
import ProductPills, { type ProductSection } from './ProductPills';

export default function ProductsTab() {
  const [activeSection, setActiveSection] = useState<ProductSection>('dishes');

  return (
    <div className="flex flex-col">
      <ProductPills activeSection={activeSection} onSectionChange={setActiveSection} />
      {activeSection === 'dishes' ? <DishesTab /> : null}
      {activeSection === 'mealplan' ? <MealPlanTab /> : null}
      {activeSection === 'campaigns' ? <CampaignsTab /> : null}
    </div>
  );
}
