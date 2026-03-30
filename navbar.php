<?php $current = basename($_SERVER['PHP_SELF']); ?>
<header>
    <img src="resources/logo.svg" alt=".INSAT" class="logo">
    <nav class="navbar">
        <ul class="navlinks">
            <li><a href="Home.php" class="<?= $current === 'Home.php' ? 'active' : '' ?>">Home</a></li>
            <li><a href="PFE.php" class="<?= $current === 'PFE.php' ? 'active' : '' ?>">PFE</a></li>
            <li><a href="PFE.php" class="<?= $current === 'PFE.php' ? 'active' : '' ?>">GPA</a></li>
            <li><a href="PFE.php" class="<?= $current === 'PFE.php' ? 'active' : '' ?>">Resources</a></li>
            <li><a href="PFE.php" class="<?= $current === 'PFE.php' ? 'active' : '' ?>">Carpooling</a></li>
        </ul>
        </ul>
    </nav>
    <div class="header-right">
        <a href="login.php" class="connect-btn">Connect</a>
    </div>
</header>