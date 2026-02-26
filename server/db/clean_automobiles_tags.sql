-- SQL to clean HTML tags and entities from the automobiles table
UPDATE automobiles 
SET 
    description = regexp_replace(description, '<[^>]*>', '', 'g'),
    press_release = regexp_replace(press_release, '<[^>]*>', '', 'g'),
    name = replace(name, '&amp;', '&')
WHERE description LIKE '%<% ' OR press_release LIKE '%<% ' OR name LIKE '%&%';

-- Clean common HTML entities
UPDATE automobiles
SET
    description = replace(replace(replace(description, '&amp;', '&'), '&nbsp;', ' '), '&quot;', '"'),
    press_release = replace(replace(replace(press_release, '&amp;', '&'), '&nbsp;', ' '), '&quot;', '"')
WHERE description LIKE '%&%' OR press_release LIKE '%&%';
