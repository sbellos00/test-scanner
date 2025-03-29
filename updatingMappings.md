# Open Database
Launch DB Browser for SQLite for db/mappinng.db. (project file in the parent folder)

# Edit Mappings
Go to “Browse Data” > target_mappings table.
Add, edit, or delete rows (e.g., target: "newtarget", channel: "new-channel").
Click “Write Changes”.

# Generate JSON
In Git Bash:
npx ts-node scripts/exportMappings.ts

# Update Seed (Optional)
If you want init.sql to reflect changes:
In DB Browser, go to “File” > “Export” > “Database to SQL file” > Save as db/init.sql.
Overwrite the existing file.

# Deploy
Commit and push:
git add db/init.sql config/targetMappings.json
git commit -m "Update target mappings"
git push
vercel