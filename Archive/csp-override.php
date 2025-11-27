<?php
/**
 * CSP Override Script
 * 
 * This file removes server-level CSP headers that are blocking Google Sign-In and Chart.js
 * Include this at the top of your HTML files if CSP is causing issues
 */

// Remove any existing CSP headers set by the server
header_remove('Content-Security-Policy');
header_remove('X-Content-Security-Policy');
header_remove('X-WebKit-CSP');

// Set a permissive CSP that allows Google Sign-In and Chart.js
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://static.cloudflareinsights.com https://cdn.jsdelivr.net; frame-src https://accounts.google.com; connect-src 'self' https://accounts.google.com https://cloudflareinsights.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' https: data:;");
?>

