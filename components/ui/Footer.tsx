import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-[#A0A0A0] py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-[#FFD700] mb-4 block">
              PhimHayTV
            </Link>
            <p className="text-[#A0A0A0] mb-4">
              PhimHayTV là nơi để bạn tìm kiếm và xem phim HD chất lượng cao.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-[#A0A0A0] hover:text-[#FFD700] transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-[#A0A0A0] hover:text-[#FFD700] transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-[#A0A0A0] hover:text-[#FFD700] transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-[#A0A0A0] hover:text-[#FFD700] transition-colors">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          {/* <div>
            <h3 className="text-[#EAEAEA] font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/movies" className="hover:text-[#FFD700] transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv-shows" className="hover:text-[#FFD700] transition-colors">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/my-list" className="hover:text-[#FFD700] transition-colors">
                  My List
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#FFD700] transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Support */}
          {/* <div>
            <h3 className="text-[#EAEAEA] font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-[#FFD700] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FFD700] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FFD700] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FFD700] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div> */}
        </div>

        <div className="border-t border-[#2A2A2A] mt-8 pt-8 text-left">
          <h3 className="font-semibold text-white mb-2">Miễn trừ trách nhiệm</h3>
          <p className="text-xs text-gray-400 mb-2">
            Trang web này cung cấp nội dung phim chỉ với mục đích giải trí và không chịu trách nhiệm về bất kỳ nội dung quảng cáo, liên kết của bên thứ ba hiển thị trên trang web của chúng tôi.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Tất cả thông tin và hình ảnh trên website đều được thu thập từ internet. Chúng tôi không chịu trách nhiệm về bất kỳ nội dung nào. Nếu bạn hoặc tổ chức của bạn có vấn đề gì liên quan đến nội dung hiển thị trên website, vui lòng liên hệ với chúng tôi để được giải quyết.
          </p>
          <p className="text-center">&copy; 2025 PhimHayTV. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}