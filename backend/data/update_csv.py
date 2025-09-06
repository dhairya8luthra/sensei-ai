import csv
import re
import urllib.parse

def slugify(title):
    # Lowercase, remove non-alphanumeric except spaces, replace spaces with hyphens
    slug = re.sub(r'[^a-z0-9 ]+', '', title.lower())
    slug = re.sub(r'\s+', '-', slug).strip('-')
    return slug

input_csv  = 'upgrad_courses.csv'
output_csv = 'upgrad_courses_with_url.csv'

with open(input_csv,  newline='', encoding='utf-8') as infile, \
     open(output_csv, 'w', newline='', encoding='utf-8') as outfile:

    # Read all columns dynamically
    reader    = csv.reader(infile)
    header    = next(reader)
    # Add 'url' as new column
    header.append('url')

    writer    = csv.writer(outfile)
    writer.writerow(header)

    for row in reader:
        course_name = row[0]  # Assuming first column is course name
        if course_name:
            slug = slugify(course_name)
            url  = urllib.parse.urljoin('https://www.upgrad.com/', slug)
        else:
            url = ''
        # Append URL and write full row
        writer.writerow(row + [url])

print(f"Generated '{output_csv}' with URLs for each course.")
