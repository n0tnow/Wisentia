#!/bin/bash

echo "Installing MUI System package for Grid v2..."
npm install @mui/system

echo "Installation complete! Now follow these steps:"
echo "1. Replace Grid imports in your components:"
echo "   FROM: import { Grid } from '@mui/material';"
echo "   TO:   import Grid from '@mui/material/Unstable_Grid2';"
echo ""
echo "2. Remove the 'item' prop from Grid components that have it"
echo "   FROM: <Grid item xs={12}>"
echo "   TO:   <Grid xs={12}>"
echo ""
echo "3. Leave all sizing props (xs, sm, md) as they are"
echo ""
echo "For more details, see the guide at: wisentia_frontend/src/guide-to-fix-mui-grid.md" 