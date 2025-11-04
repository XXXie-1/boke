'use client'

import { useState } from 'react'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Tag, Category } from '@/lib/supabase'

interface FilterPanelProps {
  tags: Tag[]
  categories: Category[]
  selectedTags: string[]
  selectedCategories: string[]
  onTagToggle: (tagSlug: string) => void
  onCategoryToggle: (categorySlug: string) => void
  onClearFilters: () => void
  className?: string
}

export function FilterPanel({
  tags,
  categories,
  selectedTags,
  selectedCategories,
  onTagToggle,
  onCategoryToggle,
  onClearFilters,
  className = ''
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasActiveFilters = selectedTags.length > 0 || selectedCategories.length > 0

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              Filters
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                {selectedTags.length + selectedCategories.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClearFilters()
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Clear all
              </button>
            )}
            <XMarkIcon 
              className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Tags Filter */}
          {tags.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.slug)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => onTagToggle(tag.slug)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={{
                        backgroundColor: isSelected && tag.color ? tag.color : undefined
                      }}
                    >
                      {tag.name}
                      <span className="ml-1 text-xs opacity-75">
                        (0)
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.slug)
                  return (
                    <button
                      key={category.id}
                      onClick={() => onCategoryToggle(category.slug)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.name}
                      <span className="ml-1 text-xs opacity-75">
                        (0)
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Active Filters
              </h3>
              <div className="space-y-2">
                {selectedTags.map(tagSlug => {
                  const tag = tags.find(t => t.slug === tagSlug)
                  return tag ? (
                    <div key={tagSlug} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tag: {tag.name}
                      </span>
                      <button
                        onClick={() => onTagToggle(tagSlug)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null
                })}
                {selectedCategories.map(categorySlug => {
                  const category = categories.find(c => c.slug === categorySlug)
                  return category ? (
                    <div key={categorySlug} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Category: {category.name}
                      </span>
                      <button
                        onClick={() => onCategoryToggle(categorySlug)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}