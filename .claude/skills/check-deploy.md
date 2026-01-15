# Check Koyeb Deployment

Use this skill to verify the Koyeb deployment status after pushing code.

## Service Info
- App: `curious-micki`
- Service: `claude-porn`
- URL: https://claude-porn.fr

## Instructions

1. **Check service status**:
   ```bash
   koyeb service get curious-micki/claude-porn
   ```
   Look for `STATUS: HEALTHY`

2. **List instances**:
   ```bash
   koyeb instances list
   ```
   Verify all instances show `STATUS: HEALTHY`

3. **If deployment fails or is unhealthy**:
   - Check deployment logs:
     ```bash
     koyeb service logs curious-micki/claude-porn
     ```
   - Check build logs if needed:
     ```bash
     koyeb service logs curious-micki/claude-porn --type build
     ```

4. **Report to user**:
   - ✅ If HEALTHY: "Déploiement OK, le site est en ligne"
   - ⚠️ If not HEALTHY: Show the status and relevant logs

## When to use
- **ALWAYS** after `git push` to main
- When user reports site issues
- Before considering a task complete
