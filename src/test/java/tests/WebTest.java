package tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import org.testng.Assert;


public class WebTest {
    private WebDriver driver;

    @BeforeTest
    public void setup() {
        // Đặt đường dẫn đến ChromeDriver (Cập nhật đúng vị trí của bạn)
        System.setProperty("webdriver.chrome.driver", "src/test/java/drivers/chromedriver.exe");
        // Cấu hình Chrome chạy ở chế độ an toàn
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--disable-features=WebRtcHideLocalIpsWithMdns");
        options.addArguments("--disable-blink-features=AutomationControlled");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--remote-debugging-port=9222");  // Đặt port cố định
        options.addArguments("--headless=new");  // Chạy ẩn Chrome để tăng hiệu suất

        // Khởi tạo WebDriver
        driver = new ChromeDriver(options);
    }

    @Test
    public void testTitle() {
        driver.get("http://localhost:5500/src/main/webapp/index.html"); // Chạy test trên localhost
        String actualTitle = driver.getTitle();
        System.out.println("Page title is: " + actualTitle);

        String expectedTitle = "Trang chủ"; // Đổi thành tiêu đề thực tế từ HTML
        Assert.assertEquals(actualTitle, expectedTitle, "Tiêu đề trang không khớp!");
    }
    
    @AfterTest
    public void teardown() {
        if (driver != null) {
            driver.quit();  // Đóng trình duyệt sau khi test xong
        }
    }
}
