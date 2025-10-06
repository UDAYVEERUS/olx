import Link from 'next/link';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
        {category.icon && (
          <div className="text-4xl mb-3">{category.icon}</div>
        )}
        <h3 className="font-semibold text-lg text-gray-800">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}