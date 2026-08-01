from django.core.management.base import BaseCommand
from ai_image_search_and_sync import sync_images_for_skus


class Command(BaseCommand):
    help = "Sync product images using LangChain & DuckDuckGo Image Search Tool"

    def add_arguments(self, parser):
        parser.add_argument(
            '--sku',
            nargs='+',
            type=str,
            help='One or more product SKUs to search and sync images for.'
        )
        parser.add_argument(
            '--missing-only',
            action='store_true',
            help='Sync images only for products that currently do not have a thumbnail.'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Sync images for all products in the database.'
        )

    def handle(self, *args, **options):
        skus = options.get('sku')
        missing_only = options.get('missing_only')
        sync_all = options.get('all')

        self.stdout.write(self.style.SUCCESS("Starting LangChain & DuckDuckGo Product Image Sync..."))

        if skus:
            self.stdout.write(f"Syncing images for SKU(s): {', '.join(skus)}")
            updated = sync_images_for_skus(skus=skus)
        elif missing_only:
            self.stdout.write("Syncing images for products missing thumbnails...")
            updated = sync_images_for_skus(missing_only=True)
        elif sync_all:
            self.stdout.write("Syncing images for all products...")
            updated = sync_images_for_skus(skus=None, missing_only=False)
        else:
            self.stdout.write("No filter specified. Syncing images for products missing thumbnails by default...")
            updated = sync_images_for_skus(missing_only=True)

        self.stdout.write(self.style.SUCCESS(f"Completed! Successfully updated {updated} product images."))
