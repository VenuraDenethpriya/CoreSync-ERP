# Guide: Securing Your EC2 Application with NGINX, Let's Encrypt, and HTTPS

This document provides a comprehensive, step-by-step guide to securing your web application running on an AWS EC2 instance. By the end of this guide, you will have implemented a production-grade architecture where NGINX acts as a reverse proxy, all traffic is encrypted using a free SSL certificate from Let's Encrypt, and your backend application is no longer directly exposed to the internet.

## Prerequisites

Before you begin, ensure you have the following:

1.  An AWS EC2 instance running a Debian-based Linux distribution (like Ubuntu).
2.  A registered domain name (e.g., `your_domain.com`).
3.  The DNS 'A' record for your domain pointing to the public IP address of your EC2 instance.
4.  Your backend application running on a specific port (we will use `8080` as a placeholder).
5.  `sudo` or root access to your EC2 instance.

---

## Step 1: Install NGINX

First, we need to install the NGINX web server, which will act as our reverse proxy.

1.  **Update your package manager's repository information:**
    ```bash
    sudo apt-get update
    ```

2.  **Install NGINX:**
    ```bash
    sudo apt-get install nginx -y
    ```

3.  **Verify that NGINX is running:**
    You can check the status of the NGINX service to ensure it was installed and started correctly.
    ```bash
    sudo systemctl status nginx
    ```
    You should see an `active (running)` status in the output. Press `q` to exit the status view.

---

## Step 2: Configure AWS Security Group

This is a critical step to secure your application. We will configure the firewall rules in your EC2 instance's security group to allow legitimate web traffic and block direct public access to your backend application.

1.  Navigate to the **EC2 Dashboard** in your AWS Management Console.
2.  In the left-hand navigation pane, click on **Instances**.
3.  Select your EC2 instance from the list.
4.  In the details pane below, click on the **Security** tab. You will see a link to your security group (e.g., `sg-012345abcdef`). Click on it.
5.  Select the **Inbound rules** tab and click **Edit inbound rules**.
6.  Modify the rules as follows:

    *   **Rule 1: Allow HTTP (for Certbot validation)**
        *   **Type:** `HTTP`
        *   **Protocol:** `TCP`
        *   **Port range:** `80`
        *   **Source:** `Anywhere-IPv4` (which corresponds to `0.0.0.0/0`)
        *   **Description (optional):** `Allow HTTP traffic for Let's Encrypt validation`

    *   **Rule 2: Allow HTTPS (for web traffic)**
        *   Click **Add rule**.
        *   **Type:** `HTTPS`
        *   **Protocol:** `TCP`
        *   **Port range:** `443`
        *   **Source:** `Anywhere-IPv4` (`0.0.0.0/0`)
        *   **Description (optional):** `Allow public HTTPS traffic`

    *   **Rule 3: Restrict Backend Port Access**
        *   Find the existing rule that allows access to your backend port (e.g., `8080`). If it doesn't exist, you don't need to add it, but ensure no other rule is exposing it.
        *   If the rule exists and its **Source** is `Anywhere-IPv4` (`0.0.0.0/0`), you must change it.
        *   **Type:** `Custom TCP`
        *   **Protocol:** `TCP`
        *   **Port range:** `8080` (replace with your application's actual port)
        *   **Source:** Change this from `Anywhere` to `Custom` and enter the **ID of your security group** itself (e.g., `sg-012345abcdef`). This allows resources within the same security group (like NGINX) to access the port, but blocks all public access.
        *   **Description (optional):** `Allow local access from NGINX to backend app`

7.  Click **Save rules**.

---

## Step 3: Obtain and Install SSL Certificate with Certbot

Now we will use Let's Encrypt's Certbot to automatically obtain and install a free SSL certificate.

1.  **Install Certbot and the NGINX plugin:**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx -y
    ```

2.  **Run Certbot to get the certificate:**
    Execute the following command. Make sure to replace `your_domain.com` with your actual domain name.
    ```bash
    sudo certbot --nginx -d your_domain.com -d www.your_domain.com
    ```
    *   **Note:** If you don't use the `www` subdomain, you can omit the second `-d` flag.

3.  **Follow the interactive prompts:**
    *   You will be asked to enter your email address for renewal notices.
    *   You will need to agree to the Let's Encrypt Terms of Service.
    *   You may be asked if you want to share your email with the Electronic Frontier Foundation (optional).
    *   Certbot will then ask if you want to redirect HTTP traffic to HTTPS. It is highly recommended to choose the **Redirect** option.

If successful, Certbot will confirm that the certificate has been deployed and will tell you where the certificate and key files are saved. It also automatically configures a cron job to renew your certificate before it expires.

---

## Step 4: Configure NGINX as a Reverse Proxy

Certbot has already modified your NGINX configuration to handle SSL. Now, we just need to add the reverse proxy configuration to forward requests to your backend application.

1.  **Open your domain's NGINX configuration file.** Certbot usually modifies the default file or creates a new one. A common location is `/etc/nginx/sites-available/default`. Use a text editor like `nano` to open it:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ```

2.  **Update the `server` block.** Your file will already have a `server` block listening on port 443, configured by Certbot. You need to modify the `location /` block within it. The final server block should look like this. **Replace the existing `location /` block with the one below.**

    ```nginx
    server {
        listen 443 ssl;
        server_name your_domain.com www.your_domain.com;

        # SSL configuration from Certbot
        ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        # Reverse Proxy configuration
        location / {
            proxy_pass http://localhost:8080; # IMPORTANT: Replace 8080 with your app's port
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Certbot may have added a block for http to https redirection.
        # It should look something like this:
        # listen 80;
        # server_name your_domain.com www.your_domain.com;
        # return 301 https://$server_name$request_uri;
    }
    ```
    *   **Important:** Make sure the `proxy_pass` directive points to the correct port your application is running on.

3.  **Test your NGINX configuration for syntax errors:**
    Always run this command before restarting NGINX to avoid downtime.
    ```bash
    sudo nginx -t
    ```
    If the test is successful, you will see a message like:
    ```
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    ```

4.  **Restart NGINX to apply the changes:**
    ```bash
    sudo systemctl restart nginx
    ```

---

## Step 5: Verification

Your secure reverse proxy should now be fully configured. Let's verify it.

-   [ ] **Check HTTPS Redirection:** Open a web browser and navigate to `http://your_domain.com`. It should automatically redirect to `https://your_domain.com`.

-   [ ] **Check SSL Certificate:** When you visit `https://your_domain.com`, your browser should show a padlock icon in the address bar, indicating a secure connection. Clicking on it should show details about the valid certificate issued by Let's Encrypt.

-   [ ] **Verify Application Access:** Your application should load correctly when accessed through `https://your_domain.com`.

-   [ ] **Verify Backend is Secured:** Try to access your backend application directly using the public IP of your EC2 instance: `http://<YOUR_EC2_PUBLIC_IP>:8080`. This request should fail (it will time out and the browser will show a "This site can’t be reached" error). This proves your security group rule is working correctly.

Congratulations! Your application is now secure.
