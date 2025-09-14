const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 Navegando a https://www.cobroya.mx/login');
    await page.goto('https://www.cobroya.mx/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    console.log('📄 Página cargada, buscando botón de Google...');

    // Take a screenshot of initial state
    await page.screenshot({ path: 'login-page.png' });
    console.log('📸 Captura de pantalla guardada: login-page.png');

    // Look for Google login button
    const googleButton = page.locator('button:has-text("Continuar con Google")');
    const isVisible = await googleButton.isVisible();

    if (!isVisible) {
      console.log('❌ No se encontró el botón de Google');
      console.log('🔍 Botones disponibles:');
      const buttons = await page.locator('button').all();
      for (let button of buttons) {
        const text = await button.textContent();
        console.log(`  - "${text}"`);
      }
      return;
    }

    console.log('✅ Botón de Google encontrado');

    // Click the Google button
    console.log('🖱️ Haciendo clic en el botón de Google...');
    await googleButton.click();

    // Wait for navigation or loading state
    await page.waitForTimeout(3000);

    // Take screenshot after click
    await page.screenshot({ path: 'after-google-click.png' });
    console.log('📸 Captura después del clic: after-google-click.png');

    // Check if we were redirected to Google OAuth
    const currentUrl = page.url();
    console.log('🌐 URL actual:', currentUrl);

    if (currentUrl.includes('accounts.google.com')) {
      console.log('✅ Redirigido exitosamente a Google OAuth');
    } else if (currentUrl.includes('supabase')) {
      console.log('🔐 Redirigido a Supabase OAuth');
    } else if (currentUrl === 'https://www.cobroya.mx/login') {
      console.log('❌ Permanece en la página de login - posible error');

      // Check for any error messages
      const errorMessages = await page.locator('[class*="error"], [class*="alert"]').all();
      for (let error of errorMessages) {
        const text = await error.textContent();
        console.log('❌ Error encontrado:', text);
      }
    } else {
      console.log('🤔 URL inesperada:', currentUrl);
    }

    // Check browser console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔥 Error del navegador:', msg.text());
      }
    });

    // Wait a bit more to see if anything happens
    await page.waitForTimeout(5000);

    console.log('✅ Test completado');

  } catch (error) {
    console.error('❌ Error durante el test:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();