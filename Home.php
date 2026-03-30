<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>home</title>
    <link href="css/Layout.css" rel="stylesheet">
    <link href="css/Home.css" rel="stylesheet">
</head>

<body>
    <?php include 'navbar.php'; ?>

    <main>
        <section class="hero">
            <h1>INSAT All In One Platform</h1>
            <a href="#" class="hero-btn">Lorem Ipsum</a>
        </section>
    </main>
    <section class="axe-section">
        <div class="orbit-container">
            <img src="resources/insat-corners.png" alt="axe" class="axe-center">
            <div class="orbit-ring" id="orbitRing">
                <img src="resources/gpa.png" alt="GPA" class="orbit-item">
                <img src="resources/carpooling.png" alt="Carpooling" class="orbit-item">
                <img src="resources/docs.png" alt="Resources" class="orbit-item">
                <img src="resources/pfe.png" alt="PFE" class="orbit-item">
            </div>
        </div>

    </section>
    <script>
        const items = document.querySelectorAll('.orbit-item');

        let angle = 0;
        let paused = false;

        const startAngles = [270, 0, 90, 180];

        const radiusX = 380;
        const radiusY = 250;
        const tilt = 30; // tilt angle in degrees (adjust this to your liking)
        const offsetY = -20; // the rotation center offset on the y axis
        const tiltRad = (tilt * Math.PI) / 180;

        function animate() {
            if (!paused) angle += 0.4;

            items.forEach((item, index) => {
                const itemAngle = angle + startAngles[index];
                const rad = (itemAngle * Math.PI) / 180;

                // flat ellipse coords
                const x0 = Math.cos(rad) * radiusX;
                const y0 = Math.sin(rad) * radiusY;

                // ✅ apply tilt rotation matrix
                const x = x0 * Math.cos(tiltRad) - y0 * Math.sin(tiltRad);
                const y = x0 * Math.sin(tiltRad) + y0 * Math.cos(tiltRad);

                // depth based on y position (lower = front, higher = back)
                const zIndex = y > 0 ? 10 : 1;
                const scale = 0.85 + ((y / radiusY) + 1) * 0.1;

                item.style.transform = `translate(${x}px, ${y + offsetY}px) scale(${scale})`;
                item.style.zIndex = zIndex;
            });

            requestAnimationFrame(animate);
        }

        items.forEach(item => {
            item.addEventListener('mouseenter', () => paused = true);
            item.addEventListener('mouseleave', () => paused = false);
        });

        animate();
    </script>

</body>

</html>